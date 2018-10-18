const path = require('path');
const fs = require('fs');

const date = new Date();
const prefix = date.getFullYear() + '' + (date.getMonth() + 1) + '' + date.getDate();
const angularCliJsonFileName = './angular.json';
const packageJsonFileName = './package.json';
let bucketStr = '';
let buildEnv = '';

const config = {
    'src_dir': path.resolve('dist/').replace(/\\/g, '/'),
    'bucket': '',
    'key_prefix': '',
    'up_host': 'http://up-z2.qiniup.com',
    'overwrite': true,
    'skip_fixed_strings': '.svn,.git',
    'skip_suffixes': '.DS_Store,.exe',
    'log_stdout': true
};

if (process.argv[2] === 'develop' || process.argv[2] === 'newAssembly') {
    bucketStr = process.env.QINIU_TEST;
    buildEnv = 'ng build --configuration';
} else {
    bucketStr = process.env.QINIU_PROD;
    buildEnv = 'ng build --prod --build-optimizer --aot';
}

if (!bucketStr) {
    throw new Error('config get error');
}

const bucketConfig = JSON.parse(bucketStr);
config.bucket = bucketConfig.bucket;
config.key_prefix = 'paper/' + prefix + process.env.CI_COMMIT_SHA.substring(0, 8) + '/';

const url = bucketConfig.domain + '/' + config.key_prefix;

const angularCli = JSON.parse(fs.readFileSync(angularCliJsonFileName, 'utf-8'));
const packageJson = JSON.parse(fs.readFileSync(packageJsonFileName, 'utf-8'));

if (angularCli.projects) {
    // angularCli.projects.deployUrl = url;
}

packageJson.scripts.build = buildEnv;

fs.writeFileSync(packageJsonFileName, JSON.stringify(packageJson));
fs.writeFileSync(angularCliJsonFileName, JSON.stringify(angularCli));
fs.writeFileSync('qiniuconfig', JSON.stringify(config));
