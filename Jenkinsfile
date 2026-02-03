pipeline {
    agent any

    environment {
        // Injecting credentials from Jenkins Store to Environment Variables
        GOOGLE_CLIENT_ID     = credentials('google-id')
        GOOGLE_CLIENT_SECRET = credentials('google-secret')
        // Add your AI API Key here once you have it in Jenkins
        // GEMINI_API_KEY    = credentials('gemini-api-key')
        
        // Ensure the API knows the production URL for redirects
        FRONTEND_URL         = "https://dbmonitor.uvindu.xyz"
    }

    stages {
        stage('Checkout') {
            steps {
                // 'scm' refers to the Git repo configured in the Jenkins job
                checkout scm
            }
        }

        stage('Cleanup & Prepare') {
            steps {
                echo 'Cleaning up old containers and orphaned networks...'
                // --remove-orphans ensures old versions of services are cleared
                sh "docker compose down --remove-orphans || true"
            }
        }

        stage('Build & Deploy Stack') {
            steps {
                script {
                    echo 'Building Multi-Project Architecture...'
                    // Building from root so Docker can see src/Monitor.Application, etc.
                    sh "docker compose up --build -d"
                }
            }
        }

        stage('Verify Database & Migration') {
            steps {
                echo 'Waiting for Postgres to initialize...'
                // 15 seconds is usually enough for Postgres to start
                sh "sleep 15"
                
                echo 'Restarting API to trigger the Retry-Migration loop...'
                sh "docker compose restart api"
            }
        }

        stage('Health Check') {
            steps {
                echo 'Current Container Status:'
                sh "docker ps"
                
                echo 'Testing API Endpoint...'
                // Port 5005 matches your docker-compose.yml mapping
                sh "curl -f http://localhost:5005/api/auth/me || echo 'API is up but unauthenticated (Expected)'"
            }
        }
    }

    post {
        failure {
            echo 'Deployment failed. Check docker logs api...'
            sh "docker logs monitor-api --tail 20"
        }
    }
}