from app import create_app
import os

app = create_app()

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    # Listen on all network interfaces (0.0.0.0) so mobile devices can connect
    app.run(debug=True, host='0.0.0.0', port=port)
