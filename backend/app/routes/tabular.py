from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename
import pandas as pd
import numpy as np
import scipy.stats as stats
import io
from bson import ObjectId
from datetime import datetime
import json

bp = Blueprint('tabular', __name__, url_prefix='/tabular')
ALLOWED_EXTENSIONS = {'csv', 'xlsx'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@bp.route('/upload', methods=['POST'])
def upload_dataset():
    if 'file' not in request.files:
        return jsonify({"error": "No file provided"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    if file and allowed_file(file.filename):
        try:
            # Read and parse file
            if file.filename.endswith('.csv'):
                df = pd.read_csv(io.StringIO(file.read().decode('utf-8')))
            else:
                df = pd.read_excel(file)
            
            # Convert to JSON-serializable format
            dataset = {
                "filename": secure_filename(file.filename),
                "columns": [{"name": col, "type": str(df[col].dtype)} for col in df.columns],
                "rows": df.replace({np.nan: None}).to_dict('records'),
                "created_at": datetime.utcnow(),
                "stats": {}
            }
            
            # Store in MongoDB
            result = current_app.config['MONGO_DB'].datasets.insert_one(dataset)
            return jsonify({
                "message": "Dataset uploaded successfully",
                "id": str(result.inserted_id),
                "columns": [col['name'] for col in dataset['columns']],
                "rowCount": len(dataset['rows'])
            }), 201
            
        except Exception as e:
            return jsonify({"error": f"File processing error: {str(e)}"}), 500
    
    return jsonify({"error": "Invalid file type"}), 400

@bp.route('/datasets', methods=['GET'])
def get_datasets():
    try:
        datasets = list(current_app.config['MONGO_DB'].datasets.find(
            {}, 
            {"filename": 1, "created_at": 1, "columns": 1}
        ))
        
        for ds in datasets:
            ds['_id'] = str(ds['_id'])
            ds['created_at'] = ds['created_at'].isoformat()
            ds['columnCount'] = len(ds['columns'])
            
        return jsonify(datasets), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@bp.route('/datasets/<dataset_id>', methods=['GET', 'PUT', 'DELETE'])
def manage_dataset(dataset_id):
    try:
        obj_id = ObjectId(dataset_id)
    except:
        return jsonify({"error": "Invalid ID format"}), 400

    dataset = current_app.config['MONGO_DB'].datasets.find_one({"_id": obj_id})
    if not dataset:
        return jsonify({"error": "Dataset not found"}), 404

    if request.method == 'GET':
        dataset['_id'] = str(dataset['_id'])
        dataset['created_at'] = dataset['created_at'].isoformat()
        return jsonify(dataset), 200

    elif request.method == 'PUT':
        try:
            update_data = request.json
            current_app.config['MONGO_DB'].datasets.update_one(
                {"_id": obj_id},
                {"$set": {
                    "rows": update_data.get('rows', dataset['rows']),
                    "columns": update_data.get('columns', dataset['columns'])
                }}
            )
            return jsonify({"message": "Dataset updated successfully"}), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    elif request.method == 'DELETE':
        current_app.config['MONGO_DB'].datasets.delete_one({"_id": obj_id})
        return jsonify({"message": "Dataset deleted successfully"}), 200

@bp.route('/datasets/<dataset_id>/stats', methods=['GET'])
def compute_statistics(dataset_id):
    try:
        dataset = current_app.config['MONGO_DB'].datasets.find_one(
            {"_id": ObjectId(dataset_id)},
            {"rows": 1, "columns": 1}
        )
        
        df = pd.DataFrame(dataset['rows'])
        stats_results = {}
        
        for col in dataset['columns']:
            if pd.api.types.is_numeric_dtype(df[col['name']]):
                col_data = df[col['name']].dropna()
                if not col_data.empty:
                    q1, q2, q3 = np.percentile(col_data, [25, 50, 75])
                    iqr = q3 - q1
                    stats_results[col['name']] = {
                        "mean": float(col_data.mean()),
                        "median": float(col_data.median()),
                        "mode": float(stats.mode(col_data)[0][0]),
                        "quartiles": [float(q1), float(q2), float(q3)],
                        "min": float(col_data.min()),
                        "max": float(col_data.max()),
                        "std": float(col_data.std()),
                        "outliers": col_data[
                            (col_data < q1 - 1.5*iqr) | 
                            (col_data > q3 + 1.5*iqr)
                        ].tolist()
                    }
        
        # Update dataset with stats
        current_app.config['MONGO_DB'].datasets.update_one(
            {"_id": ObjectId(dataset_id)},
            {"$set": {"stats": stats_results}}
        )
        
        return jsonify(stats_results), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@bp.route('/datasets/<dataset_id>/query', methods=['POST'])
def complex_query(dataset_id):
    try:
        query_params = request.json
        dataset = current_app.config['MONGO_DB'].datasets.find_one(
            {"_id": ObjectId(dataset_id)},
            {"rows": 1}
        )
        
        df = pd.DataFrame(dataset['rows'])
        
        # Apply filters
        if 'filters' in query_params:
            for filter in query_params['filters']:
                column = filter['column']
                operator = filter['operator']
                value = filter['value']
                
                if operator == 'eq':
                    df = df[df[column] == value]
                elif operator == 'gt':
                    df = df[df[column] > value]
                elif operator == 'lt':
                    df = df[df[column] < value]
                # Add more operators as needed
        
        # Apply sorting
        if 'sort' in query_params:
            df = df.sort_values(
                query_params['sort']['columns'],
                ascending=query_params['sort'].get('ascending', True)
            )
        
        # Apply pagination
        page = query_params.get('page', 1)
        per_page = query_params.get('per_page', 100)
        total = len(df)
        df = df.iloc[(page-1)*per_page : page*per_page]
        
        return jsonify({
            "data": df.replace({np.nan: None}).to_dict('records'),
            "total": total,
            "page": page,
            "per_page": per_page
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500