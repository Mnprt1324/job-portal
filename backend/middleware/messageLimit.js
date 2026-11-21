// Bounded single-process limits. Replace with a shared limiter before adding replicas.
const buckets=new Map();
function consume(key,max=40,windowMs=60000){
  const now=Date.now();let bucket=buckets.get(key);
  if(!bucket||bucket.until<=now){bucket={count:0,until:now+windowMs};buckets.set(key,bucket);}
  if(++bucket.count>max)throw Object.assign(new Error('Too many requests. Please try again shortly.'),{status:429});
}
const cleanup=setInterval(()=>{const now=Date.now();for(const [key,b] of buckets)if(b.until<=now)buckets.delete(key);},60000);cleanup.unref();
module.exports={consume};
