const {test}=require('node:test');
const assert=require('node:assert/strict');
const {activityWindow,buildCharts}=require('../utils/adminCharts');
test('Activity uses 30 calendar days with UTC boundaries',()=>{
 const {start,end}=activityWindow(new Date('2026-11-17T23:59:00Z'));
 assert.equal(start.toISOString(),'2026-10-19T00:00:00.000Z');assert.equal(end.toISOString(),'2026-11-18T00:00:00.000Z');
 const leap=activityWindow(new Date('2024-03-01T01:00:00Z'));assert.equal(leap.start.toISOString(),'2024-02-01T00:00:00.000Z');
});
test('Charts retain real totals and fill missing days and categories with zero',()=>{
 const {start}=activityWindow(new Date('2026-11-17T12:00:00Z'));
 const charts=buildCharts({start,users:[{_id:'2026-11-17',count:3}],jobs:[{_id:'2026-10-19',count:2}],applications:[{_id:'2026-11-01',count:5}],roles:[{_id:'company',count:4},{_id:'jobseeker',count:6},{_id:'admin',count:1}],statuses:[{_id:'pending',count:4},{_id:'accepted',count:1}]});
 assert.equal(charts.activity.length,30);assert.deepEqual(charts.activity[0],{date:'2026-10-19',users:0,jobs:2,applications:0});assert.equal(charts.activity.at(-1).date,'2026-11-17');assert.equal(charts.activity.at(-1).users,3);
 assert.equal(charts.activity.reduce((sum,row)=>sum+row.applications,0),5);assert.equal(charts.usersByRole.reduce((sum,row)=>sum+row.count,0),11);assert.deepEqual(charts.applicationsByStatus,[{status:'pending',count:4},{status:'accepted',count:1},{status:'rejected',count:0}]);
 const empty=buildCharts({start});assert.ok(empty.activity.every(row=>row.users===0&&row.jobs===0&&row.applications===0));assert.ok(empty.usersByRole.every(row=>row.count===0));
});
