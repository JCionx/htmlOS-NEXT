This step is needed if you need to use the CLI tool.
## If using Docker:
Run this command on your host:
```bash
docker ps | grep htmlos-next-backend
```

You will see one result. Copy the ID from that result. Now run:
```bash
docker exec -it <id> sh
```

Now you should be inside of the backend shell. You can now run CLI commands.
## If running manually:
Get inside of the folder where you cloned **htmlOS NEXT**:
```bash
cd htmlOS-NEXT
```

Open the backend folder:
```bash
cd backend
```

Now you should be inside of the backend folder. You can now run CLI commands.