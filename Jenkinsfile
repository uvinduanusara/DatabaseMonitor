pipeline {
    agent any

    environment {
        DOCKER_COMPOSE_PATH = '/usr/local/bin/docker-compose'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build & Deploy') {
            steps {
                script {
                    // This builds the images and restarts the containers
                    sh "docker compose down"
                    sh "docker compose up --build -d"
                }
            }
        }

        stage('Database Migrations') {
            steps {
                // This forces the API to run its internal migration logic
                // By waiting for the DB to be ready first
                sh "sleep 15"
                sh "docker compose restart api"
            }
        }

        stage('Health Check') {
            steps {
                sh "docker ps"
                // Check if the API returns a 200 OK
                sh "curl -f http://localhost:5000/health || exit 1"
            }
        }
    }
}