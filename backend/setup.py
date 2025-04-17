from setuptools import setup, find_packages

setup(
    name="backend",
    version="0.1.0",
    packages=find_packages(),
    install_requires=[
        "fastapi==0.115.12",
        "uvicorn==0.34.1",
        "openai==1.74.0",
        "python-dotenv==1.1.0",
        "pytest==8.1.1",
        "pytest-asyncio==0.23.5",
        "httpx==0.27.0",
        "pytest-cov==4.1.0",
    ],
) 