const roleKeys=['jobseeker','company','admin'];
const statusKeys=['pending','accepted','rejected'];
const countMap=rows=>new Map(rows.map(row=>[String(row._id),Math.max(0,Number(row.count)||0)]));
const activityWindow=(now=new Date())=>{
 const end=new Date(now);end.setUTCHours(0,0,0,0);end.setUTCDate(end.getUTCDate()+1);
 const start=new Date(end);start.setUTCDate(start.getUTCDate()-30);
 return {start,end};
};
const buildCharts=({start,users=[],jobs=[],applications=[],roles=[],statuses=[]})=>{
 const userCounts=countMap(users),jobCounts=countMap(jobs),applicationCounts=countMap(applications),roleCounts=countMap(roles),statusCounts=countMap(statuses);
 const activity=Array.from({length:30},(_,index)=>{const date=new Date(start);date.setUTCDate(date.getUTCDate()+index);const key=date.toISOString().slice(0,10);return {date:key,users:userCounts.get(key)||0,jobs:jobCounts.get(key)||0,applications:applicationCounts.get(key)||0};});
 return {activity,usersByRole:roleKeys.map(role=>({role,count:roleCounts.get(role)||0})),applicationsByStatus:statusKeys.map(status=>({status,count:statusCounts.get(status)||0}))};
};
module.exports={activityWindow,buildCharts};
