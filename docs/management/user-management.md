You can manage users in **htmlOS NEXT** by using the `cli.js` tool.
Before executing any command in this tool, you first need to be in it's container and/or directory.

To do that, first follow the instructions under: [Getting inside the backend directory](./getting-inside-the-backend-directory.md)

---

## Add a new user
To add a new user, run:
```bash
node cli.js user add <username> <password>
```
---
## Change username and password
To change a user's username and password, run:
```bash
node cli.js user edit <current_username> <new_username> [new_password]
```
---
## Reset user data
To reset a user's data, run:
```bash
node cli.js user reset <username>
```

> [!WARNING]
> Running this will delete all data for this user, including files, apps and preferences.

---

## Delete user
To delete a user, run:
```bash
node cli.js user remove <username>
```

> [!WARNING]
> Running this will delete all data for this user, including files, apps and preferences.
