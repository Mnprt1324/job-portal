const express =require("express");
const dotenv =require('dotenv');
const cors =require('cors');
const http= require('http');
const connectToDb=require('./db')
const userRoutes=require("./routes/user.routes");
const jobRoutes=require("./routes/job.routes")
const contactRouts=require("./routes/contact.routes")
const companyRoutes=require("./routes/company.routes");
const applicationRoutes=require("./routes/application.routes")
const cookieParser=require("cookie-parser");

dotenv.config();

const app=express();
// const server =http.createServer(app);

//middleware
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cors({
    origin:process.env.FRONT_URL,
    credentials:true
}));

//database connection
connectToDb();

//simple route
app.get("/",(req,res)=>{
res.send("job portal Backend is running...");
})
app.use("/users",userRoutes);
app.use("/job",jobRoutes);
app.use("/company",companyRoutes)
app.use("/applications",applicationRoutes)
app.use("/contactUs",contactRouts)
//Server start
// const PORT=process.env.PORT ||5000;
module.exports=app;
// server.listen(PORT,()=>console.log(`server is running at ${PORT}`));