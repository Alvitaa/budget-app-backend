import "dotenv/config";

export const jwtConstants = {
    secret: process.env.JWT_SECRET as string
}

export const databaseConstants = {
    databaseString: process.env.DATABASE_URL,
    port: process.env.PORT
}