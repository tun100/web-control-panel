import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as process from 'process';
import * as inquirer from 'inquirer';
var ora = require('ora');
var _ = require('lodash');
var sh = require('shelljs');
var gutils = require('global-code-utils');

function getCwdDir(targetPath) {
	return path.join(process.cwd(), targetPath);
}

function isPathExists(targetPath) {
	return fs.existsSync(targetPath);
}

function plainlog(...str) {
	console.log(...str);
}

function getArgWithoutExec() {
	return _.drop(process.argv, 2);
}

function isEmptyOrHelpArg() {
	var arr = getArgWithoutExec();
	return _.isEmpty(arr) || _.first(arr) === 'help';
}

function exitProgram(code) {
	return process.exit(code);
}

// crt project functions
function createOra(msg: string) {
	return ora(msg).start();
}

const helpText = `web-control-panel help
Usage: wcp [command] [flags]

Displays help information.

Options: 
wcp list-project # list all project you have created
wcp new-project [dirpath] # create a webpack project at target path, default is crt cwd
wcp view # serve a website, it's could help you manage all project

About me:
Welcome to star or fork :)
Github: https://github.com/tun100/
Repository: https://github.com/tun100/web-control-panel`;

async function entryfunc() {
    plainlog(path.normalize(`~`));
	if (isEmptyOrHelpArg()) {
		// print help text
		plainlog(helpText);
	} else {
		// start analyze arguments
		let argArr: string[] = getArgWithoutExec();
		let command = _.first(argArr);
		let options = _.get(argArr, 1);
		var msgref_init = createOra('initializing task...');
		switch (command) {
			case 'list-project':
				break;
			case 'new-project':
                // check path
				if (_.isNil(options)) {
					options = getCwdDir('');
				}
				if (!isPathExists(options)) {
					msgref_init.fail(`path doesn't exists, the path is ${options}`);
					exitProgram(-1);
				}
				msgref_init.succeed(`new project path is ${options}`);
                msgref_init.stop();
				break;
			case 'view':
				break;
		}
	}
}

entryfunc();
