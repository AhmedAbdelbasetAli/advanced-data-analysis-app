# Advanced Data Analysis Platform

A unified web application for analyzing tabular data, images, and text. Built with Flask, React, and MongoDB, this platform empowers users to derive insights through statistical analysis, computer vision, and NLP-driven text processing.

---

## Features

### 📊 Tabular Data Analysis
- Upload CSV/XLSX datasets (e.g., `test_data.csv`).
- Compute statistics: mean, median, quartiles, outliers .
- Filter, sort, and paginate datasets.

### 🖼️ Image Processing
- Upload and manage images .
- Generate segmentation masks .
- Resize, crop, and convert formats (PNG, JPEG, WebP).

### 📝 Text Analytics
- Sentiment analysis with polarity/subjectivity scores.
- Automatic summarization and keyword extraction.
- Text categorization and search functionality.

---

## Technologies

| Component       | Technology | Rationale |
|-----------------|------------|-----------|
| **Backend**     | Flask      | Lightweight, Python-centric for data tasks |
| **Database**    | MongoDB    | Schema flexibility for dynamic datasets |
| **Image Processing** | OpenCV | Industry-standard CV library |
| **Frontend**    | React      | Reusable components for dynamic UIs |
| **Deployment**  | Docker     | Isolate services and simplify scaling |

---

## Installation

### Prerequisites
- Docker and Docker Compose

### Steps
1. Clone the repository:
   ```bash
   git clone (https://github.com/AhmedAbdelbasetAli/advanced-data-analysis-app.git)
   cd advanced-analysis

2.Start services:
   ```bash
   docker-compose up --build
---
## Usage

### 📊 Tabular Data
1. **Upload Datasets**  
   - Use the interactive interface to upload CSV/XLSX files (e.g., `test_data.csv`).
2. **Analyze Results**  
   - View auto-computed statistics (mean, median, outliers).  
   - Filter/sort data using the table interface.

### 🖼️ Image Processing
1. **Upload Images**  
   - Drag-and-drop or browse files (PNG/JPG supported).  
2. **Manipulate Images**  
   - Generate segmentation masks with adjustable thresholds.  
   - Resize/crop images using pixel-precise controls.

### 📝 Text Analytics
1. **Submit Text**  
   - Paste or upload text documents for analysis.  
2. **Review Insights**  
   - View summaries, top keywords, and sentiment scores (polarity/subjectivity).  

---

## API Endpoints

### Tabular (`/tabular`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/upload` | Upload CSV/XLSX datasets |
| `GET` | `/datasets/<dataset_id>/stats` | Compute statistical metrics |

### Images (`/images`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/upload` | Upload image files |
| `GET` | `/segmentation/<filename>` | Generate binary segmentation masks |

### Text (`/text`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/analyze` | Perform NLP analysis (sentiment, keywords, summary) |

---

## Future Enhancements
- 🧠 **AI Integration**: AutoML for predictive modeling on tabular data  
- 🤝 **Collaboration**: Shared workspaces with version control  
- 📱 **Mobile Support**: PWA for cross-device accessibility  

---

## Development Timeline
| Phase | Time Spent | Key Activities |
|-------|------------|----------------|
| **Research** | 60% | Tech stack evaluation, user workflow analysis |
| **Development** | 30% | API development, UI component creation |
| **Testing** | 10% | Edge case validation, performance benchmarking |

---

## Contributing
1. Fork this repository:  
   ```bash
   git clone (https://github.com/AhmedAbdelbasetAli/advanced-data-analysis-app.git)
