# learn-authentication
A simple authentication using:
1. Express as backend framework, mainly dealing with http methods(only get and post here)
2. MongoDB Atlas to store users' username and password
3. [bcryptjs middleware](https://openbase.com/js/bcryptjs/documentation):
    1. bcrypt.hash(both async and sync) to hash sign-up post password 
    2. bcrypt.compare to validate log-in post password
--- 
[Related Tutorial](https://www.theodinproject.com/paths/full-stack-javascript/courses/nodejs/lessons/authentication-basics)
