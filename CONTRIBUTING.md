# Adding Daily Posts to Pulse

## How to Add New Daily Posts

### Method 1: Manual Creation  

1. Create a new JSON file in `_data/YYYY-MM-DD.json` (e.g., `2024-12-25.json`)
2. Follow this structure:

```json
{
  "id": "ed-2024-12-25",
  "date": "2024-12-25T00:00:00.000Z",
  "title": "Your Edition Title",
  "articles": [
    {
      "id": "unique-article-id",
      "url": "https://source-url.com/article",
      "title": "Article Title",
      "shortDescription": "Brief description for the card view",
      "fullSummary": "Detailed summary of the article content",
      "imageUrl": "https://images.unsplash.com/photo-xxx",
      "date": "2024-12-25T00:00:00.000Z",
      "category": "Technology"
    }
  ]
}
```

3. Update `services/dataService.ts` to include the new date in `AVAILABLE_DATES` array
4. Commit and push to trigger automatic deployment

### Method 2: Automated Script

Create a script that generates JSON files:

```bash
#!/bin/bash
# Example: generate-post.sh

DATE=$(date +%Y-%m-%d)
cat > _data/$DATE.json << EOF
{
  "id": "ed-$DATE",
  "date": "${DATE}T00:00:00.000Z",
  "title": "Daily Edition",
  "articles": [...]
}
EOF

# Update dataService.ts to add the date
# Commit and push
git add _data/$DATE.json services/dataService.ts
git commit -m "Add daily post for $DATE"
git push
```

### Automatic Deployment

- Every push to `main` branch triggers GitHub Actions
- Site  is automatically built and deployed to GitHub Pages
- Changes are live within 2-3 minutes

## JSON Schema Reference

### DailyEdition
- `id`: Unique identifier (e.g., "ed-2024-12-25")
- `date`: ISO 8601 timestamp
- `title`: Edition theme/title
- `articles`: Array of Article objects

### Article
- `id`: Unique identifier
- `url`: Source URL
- `title`: Article headline
- `shortDescription`: 1-2 sentence summary
- `fullSummary`: Detailed content (2-3 paragraphs)
- `imageUrl`: Image URL (recommended: Unsplash)
- `date`: ISO 8601 timestamp
- `category`: Category label

## Tips

- Keep `shortDescription` under 150 characters
- Use high-quality images (1200x800px recommended)
- Categories are free-form but try to be consistent
- IDs must be unique across all editions
