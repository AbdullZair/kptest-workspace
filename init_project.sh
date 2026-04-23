#!/bin/bash

# KPTEST Project Initialization Script
# Creates complete directory structure for Telemedicine System

set -e

echo "🚀 Initializing KPTEST project structure..."

# Root directories
mkdir -p backend/src/main/java/com/kptest
mkdir -p backend/src/main/resources/db/migration
mkdir -p backend/src/test/java/com/kptest
mkdir -p backend/src/test/resources

# Backend - Domain layers
mkdir -p backend/src/main/java/com/kptest/{domain/{user,patient,therapist,project,schedule,chat,material,audit}/{entity,repository,service,dto}}
mkdir -p backend/src/main/java/com/kptest/{infrastructure/{config,security,persistence,his,integration},application/{usecase,port},api/{controller,mapper}}

# Frontend - Web App
mkdir -p frontend/src/{app,entities,features,shared,widgets}
mkdir -p frontend/src/app/{providers,router,styles}
mkdir -p frontend/src/entities/{user,patient,project,schedule,chat,material}
mkdir -p frontend/src/features/{auth,patients,projects,schedule,chat,materials,reports,admin}
mkdir -p frontend/src/shared/{api,config,hooks,lib,ui,constants}
mkdir -p frontend/src/widgets/{header,sidebar,layout}
mkdir -p frontend/public

# Mobile - React Native App
mkdir -p mobile/src/{app,entities,features,shared,widgets}
mkdir -p mobile/src/app/{navigation,providers}
mkdir -p mobile/src/entities/{user,patient,project,schedule,chat,material}
mkdir -p mobile/src/features/{auth,patients,projects,schedule,chat,materials}
mkdir -p mobile/src/shared/{api,config,hooks,lib,ui,constants}
mkdir -p mobile/src/widgets/{header,footer,layout}
mkdir -p mobile/assets

# DevOps
mkdir -p devops/{docker,kubernetes,scripts,backup}
mkdir -p .github/workflows

# Documentation
mkdir -p docs/{api,architecture,decisions,setup}

echo "✅ Directory structure created successfully!"
echo ""
echo "Next steps:"
echo "1. Run: ./setup_config.sh (to generate configuration files)"
echo "2. Initialize Git repository"
echo "3. Create GitHub repo: kptest-workspace"
