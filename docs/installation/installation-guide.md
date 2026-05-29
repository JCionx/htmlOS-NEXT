# Installation Guide

You can deploy and run **htmlOS NEXT** using one of two methods:
1. **Docker Compose** (recommended)
2. **Manual Installation**

## 1. Docker compose (recommended)
This is the fastest way to get **htmlOS NEXT** up and running.

### Prerequisites
Ensure you have Docker and Docker Compose installed.

### Setup
1. Create a `docker-compose.yml` file, and paste the following configuration:
```yaml
services:
  frontend:
    image: ghcr.io/jcionx/htmlos-next-frontend:latest
    restart: unless-stopped
    ports:
      - 80:80
    environment:
      - VITE_BACKEND_ADDRESS=<your backend address>
    
  backend:
    image: ghcr.io/jcionx/htmlos-next-backend:latest
    restart: unless-stopped
    ports:
      - 4000:4000
    volumes:
      - /your/path:/app/data
      - /your/db/path:/app/db
    environment:
      - JWT_SECRET=<your secret key>
      - FRONTEND_ADDRESSES=<your frontend address>
```
2. Customize the environment variables in the file:
- `<your backend address>`: The URL/IP address where your backend will be accessible.
- `<your frontend address>`: The URL/IP address where your frontend will be accessible.
- `/your/path`: The local directory on your host machine where user data will be persistently stored.
- `/your/db/path`: The local directory on your host machine where user the database will be persistently stored.
- `<your secret key>`: A secure string used to sign JWT tokens.

> [!TIP]
> You can quickly generate a secure key by running this command in your terminal:
> ```bash
> openssl rand -base64 32
> ```

3. Run the container in detached mode:
```bash
docker compose up -d
```

Once both containers are running, you can access **htmlOS NEXT** by opening your browser and navigating to:
http://localhost:80 (or whatever port you set)

Now you might want to know how to create a new user, since for security reasons, you can't use the web interface for that. For instructions on how to create a new user, read: [User Management](../management/user-management.md).

You might want to access **htmlOS NEXT** from anywhere. You might be interesting in forwarding it to a domain you own. For that, we can use Nginx Proxy Manager. See the guide [Forwarding with NPM](./forwarding-with-nginx-proxy-manager.md).

## 2. Manual Installation
Use this method if you want to run the application locally for development purposes.

### Prerequisites:
- Node.js (LTS version recommended)
- Git

### Step 1: Clone and build
Clone the repository and install the initial dependencies:
```bash
git clone https://github.com/JCionx/htmlOS-NEXT
cd htmlOS-NEXT
npm run build-apps
```

### Step 2:  Configure environment variables
#### Frontend Configuration
Navigate to the frontend directory and install dependencies:
```bash
cd frontend
npm install
```

Create a file named `.env` inside the `frontend` folder and add:
```
VITE_BACKEND_ADDRESS=http://localhost:4000
```
(Replace `http://localhost:4000` with your backend's actual address if it is hosted elsewhere).

#### Backend Configuration
Navigate to the backend directory and install dependencies:
```bash
cd ../backend
npm install
```

Create a file named `.env` inside the `backend` folder and add:
```
JWT_SECRET=<your secret key>
FRONTEND_ADDRESSES=http://localhost:5173
```
- `<your secret key>`: Generate using `openssl rand -base64 32`.
- `FRONTEND_ADDRESS`: The address of your frontend application (`http://localhost:5173` by default for local development).

### Step 3: Run the Application
To start the project, you will need to run the development servers for both the frontend and backend simultaneously.
1. **Start the Backend:**
In your terminal (inside the `backend` folder), run:
```bash
npm run dev
```
2. **Start the Frontend:** Open a new terminal window/tab, navigate to the `frontend` folder, and run:
```bash
npm run dev
```

Once both servers are running, you can access **htmlOS NEXT** by opening your browser and navigating to:
http://localhost:5173