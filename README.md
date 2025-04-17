# AI Insight Widget

An embeddable AI widget that analyzes webpage content and provides expert insights through a floating UI. The widget uses two AI agents (Planner + Expert) to deliver contextual, domain-specific insights about any webpage content.

## Features

- 🔍 Automatic content analysis
- 🤖 AI-powered insights from domain experts
- 🎨 Customizable UI with light/dark themes
- 🔧 Configurable via data attributes
- 🚀 SPA-friendly with MutationObserver support
- 📱 Responsive design

## Project Structure

```
/insight-widget-mvp/
├── backend/           # FastAPI server and AI agents
│   ├── main.py       # FastAPI application
│   ├── agents/       # AI agent implementations
│   └── utils/        # Utility functions
├── widget/           # Frontend widget code
│   ├── widget.js     # Widget implementation
│   └── styles.css    # Widget styling
├── public/           # Public assets and demo
│   └── demo.html     # Demo page
└── .env              # Environment variables
```

## Getting Started

### Prerequisites

- Python 3.8+
- Node.js 14+
- OpenAI API key

### Installation

1. Clone the repository
2. Install backend dependencies:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```
3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your OpenAI API key
   ```

### Development

1. Start the backend server:
   ```bash
   cd backend
   uvicorn main:app --reload
   ```
2. Build the widget:
   ```bash
   cd widget
   npm install
   npm run build
   ```

## Usage

Add the widget to your webpage:

```html
<script src="path/to/widget.js" 
        data-api="http://your-api-endpoint"
        data-theme="light"
        data-mode="floating">
</script>
```

## Configuration Options

- `data-api`: Custom API endpoint (optional)
- `data-theme`: UI theme (light/dark)
- `data-mode`: Display mode (floating/inline)
- `data-selector`: Custom DOM selector for content

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. 