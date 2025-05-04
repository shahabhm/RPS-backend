import cron from 'node-cron';

console.log('cronjob imported')

const job = cron.schedule('*/20 * * * * *', async () => {
    console.log('Daily notification cronjob running');
    try{

    } catch(err) {

    }
});

job.start();