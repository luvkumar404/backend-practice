import express from "express"
import cors from "cors"


const app = express();
const PORT=3000

app.use(express.json())
app.use(cors())


app.use("/api", router);

app.get("/", (req, res) => {
    res.send('hello world');
})


app.listen(PORT, () => {
    console.log(`Server is listening on ${PORT}`);  
})