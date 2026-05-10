// Simulated Log Ingestion Queue System

type LogJob = {
  id: string;
  data: any;
  attempts: number;
  maxAttempts: number;
};

const queue: LogJob[] = [];
const deadLetterQueue: LogJob[] = [];
const processedLogs: any[] = [];

let isProcessing = false;

const addLogToQueue = (logData: any) => {
  const job: LogJob = {
    id: `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    data: logData,
    attempts: 0,
    maxAttempts: 3,
  };
  queue.push(job);
  console.log(`[QUEUE] Added job ${job.id} to queue. Queue length: ${queue.length}`);
  
  if (!isProcessing) {
    processQueue();
  }
};

const processQueue = async () => {
  isProcessing = true;
  
  while (queue.length > 0) {
    const job = queue.shift();
    if (!job) continue;
    
    job.attempts++;
    console.log(`[WORKER] Processing job ${job.id} (Attempt ${job.attempts})...`);
    
    try {
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Simulate random failure for retry handling
      if (Math.random() > 0.8) {
        throw new Error("Simulated processing failure");
      }
      
      // Processed successfully
      processedLogs.push(job.data);
      if (processedLogs.length > 1000) processedLogs.shift();
      
      console.log(`[WORKER] Job ${job.id} processed successfully.`);
    } catch (error: any) {
      console.error(`[WORKER] Job ${job.id} failed: ${error.message}`);
      
      if (job.attempts < job.maxAttempts) {
        console.log(`[WORKER] Retrying job ${job.id}...`);
        queue.push(job); // Put back at the end
      } else {
        console.log(`[WORKER] Job ${job.id} moved to Dead Letter Queue.`);
        deadLetterQueue.push(job);
      }
    }
  }
  
  isProcessing = false;
};

export const logQueueService = {
  addLogToQueue,
  getQueueMetrics() {
    return {
      pending: queue.length,
      processed: processedLogs.length,
      failed: deadLetterQueue.length,
    };
  },
  getProcessedLogs() {
    return processedLogs;
  }
};
