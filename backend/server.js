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
const server =http.createServer(app);

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
app.get("/health", (_req, res) => {
    const databaseConnected = mongoose.connection.readyState === 1;
    if (!databaseConnected) {
        return res.status(503).json({ status: "unavailable" });
    }
    return res.status(200).json({ status: "ok" });
});
app.use("/users",userRoutes);
app.use("/job",jobRoutes);
app.use("/company",companyRoutes)
app.use("/applications",applicationRoutes)
app.use('/interviews',require('./routes/interview.routes'));
app.use("/contactUs",contactRouts)
app.use("/admin",require('./routes/admin.routes'));
app.use('/conversations',require('./routes/conversation.routes'));
app.use('/push',require('./routes/push.routes'));
app.use('/notifications',require('./routes/notification.routes'));
require('./socket').initialize(server);
//Server start
const PORT=process.env.PORT ||5000;
module.exports=app;
server.listen(PORT,()=>console.log(`server is running at ${PORT}`));
