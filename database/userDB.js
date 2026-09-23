const { prisma } = require("./config");

const createUser = async () => {

    const user = await prisma.user.create({
        data: {
            name: "Yash",
            email: "yash@example.com",
            age: 1000
        }
    })

    console.log(user);
    return user;
};

createUser();
