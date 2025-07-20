from fastapi import FastAPI

app = FastAPI(
    debug=True,
    title="AI HandsOn",
    description="AI based application hands on implementation",
    version="1.0.0",
    root_path="/api"
)

@app.get("/")
def health_test():
    return {"message":"Server is running"}