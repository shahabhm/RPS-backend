import cron from 'node-cron';

const job = cron.schedule('* * * * *', () => {
    console.log('Cron job running every minute');
});

job.start();

