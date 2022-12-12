const settings = {
  server: {
    port: process.env.HTTP_PORT,
    routes: {
      events: '/events'
    }
  },
  db: {
    url: process.env.MONGO_DB_URI
  },
}

export default settings
