from flask import Blueprint, request, jsonify, current_app
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.manifold import TSNE
from textblob import TextBlob
import numpy as np
import logging

bp = Blueprint('text', __name__, url_prefix='/text')

# Helper functions
def summarize_text(text, max_sentences=3):
    blob = TextBlob(text)
    sentences = [str(sentence) for sentence in blob.sentences]
    vectorizer = TfidfVectorizer()
    tfidf_matrix = vectorizer.fit_transform(sentences)
    sentence_scores = tfidf_matrix.sum(axis=1).A1
    top_sentence_indices = np.argsort(sentence_scores)[-max_sentences:]
    return [sentences[i] for i in sorted(top_sentence_indices)]

def extract_keywords(text, top_n=10):
    vectorizer = TfidfVectorizer(stop_words='english')
    tfidf_matrix = vectorizer.fit_transform([text])
    feature_names = vectorizer.get_feature_names_out()
    tfidf_scores = tfidf_matrix.toarray()[0]
    top_keyword_indices = np.argsort(tfidf_scores)[-top_n:]
    return [feature_names[i] for i in top_keyword_indices]

def analyze_sentiment(text):
    blob = TextBlob(text)
    return {
        "polarity": blob.sentiment.polarity,
        "subjectivity": blob.sentiment.subjectivity,
        "sentiment": "positive" if blob.sentiment.polarity > 0 else "negative" if blob.sentiment.polarity < 0 else "neutral"
    }

def generate_tsne(texts):
    vectorizer = TfidfVectorizer()
    tfidf_matrix = vectorizer.fit_transform(texts)
    tsne = TSNE(n_components=2, random_state=42)
    embeddings = tsne.fit_transform(tfidf_matrix.toarray())
    return embeddings.tolist()

# API Endpoints
@bp.route('/analyze', methods=['POST'])
def analyze_text():
    data = request.json
    text = data.get('text', '')
    
    if not text:
        return jsonify({"error": "No text provided"}), 400
    
    try:
        # Save text to MongoDB
        current_app.config['MONGO_DB'].texts.insert_one({"text": text})
        
        # Perform analysis
        summary = summarize_text(text)
        keywords = extract_keywords(text)
        sentiment = analyze_sentiment(text)
        
        return jsonify({
            "summary": summary,
            "keywords": keywords,
            "sentiment": sentiment
        }), 200
    except Exception as e:
        logging.error(f"Analysis error: {str(e)}")
        return jsonify({"error": "Text analysis failed"}), 500

@bp.route('/search', methods=['POST'])
def search_text():
    query = request.json.get('query', '')
    
    if not query:
        return jsonify({"error": "No search query provided"}), 400
    
    try:
        results = current_app.config['MONGO_DB'].texts.find(
            {"$text": {"$search": query}},
            {"score": {"$meta": "textScore"}}
        ).sort([("score", {"$meta": "textScore"})]).limit(10)
        
        return jsonify([{"text": doc["text"], "score": doc["score"]} for doc in results]), 200
    except Exception as e:
        logging.error(f"Search error: {str(e)}")
        return jsonify({"error": "Search failed"}), 500

@bp.route('/categorize', methods=['POST'])
def categorize_text():
    data = request.json
    text = data.get('text', '')
    
    if not text:
        return jsonify({"error": "No text provided"}), 400
    
    try:
        # Simple categorization based on keywords
        categories = {
            "technology": ["ai", "machine learning", "data science"],
            "business": ["finance", "marketing", "startup"],
            "health": ["fitness", "nutrition", "wellness"]
        }
        
        matched_categories = []
        for category, keywords in categories.items():
            if any(keyword in text.lower() for keyword in keywords):
                matched_categories.append(category)
        
        return jsonify({"categories": matched_categories}), 200
    except Exception as e:
        logging.error(f"Categorization error: {str(e)}")
        return jsonify({"error": "Categorization failed"}), 500