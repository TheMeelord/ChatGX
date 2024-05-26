from src.config.startup import create_app
import uvicorn

if __name__ == "__main__":
    app = create_app()
    uvicorn.run(app, host="127.0.0.1", port=5000)