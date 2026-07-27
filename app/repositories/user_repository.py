class UserRepository:
    def __init__(self) -> None:
        self.users = {}
        self.next_id = 1

    def create_user(self, user):
        user.user_id = self.next_id
        self.users[user.user_id] = user
        self.next_id += 1
        return user

    def get_user(self, user_id):
        return self.users.get(user_id)
