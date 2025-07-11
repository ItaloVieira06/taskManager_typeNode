import express  from "express";
import routes from './routes/routes'

const app = express()
const port = 3000

app.use(express.json())
app.use('/tasks', routes)

app.listen(port, () => {
    console.log('Server is running at http://localhost:${port}')
})