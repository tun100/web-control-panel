import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as process from 'process';
import * as inquirer from 'inquirer';
var sqlite3 = require('sqlite3').verbose();
var ora = require('ora');
var _ = require('lodash');
var sh = require('shelljs');
var gutils = require('global-code-utils');

var { getCrtPath, readDir, isFile, isDir } = gutils;

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

function getStoreDir(targetPath: string = '') {
	var storedir = path.join(os.homedir(), '.wcpstore', targetPath);
	return storedir;
}

function execSilent(cmd: string) {
	return new Promise((r, e) => {
		sh.exec(
			cmd,
			{
				silent: true,
				async: true,
			},
			(err, res) => {
				if (err) {
					e(err);
				} else {
					r(res);
				}
			}
		);
	});
}

const dbutils = {
	run: async function(db, sql: string, param?: {}) {
		return new Promise((res_func, err_func) => {
			db.run(sql, param, function(error, res) {
				if (error) {
					err_func(error);
				} else {
					res_func(res);
				}
			});
		});
	},
	runsafe: async function(db, sql: string, param?: {}) {
		try {
			return await dbutils.run(db, sql, param);
		} catch (error) {
			// ignore error, dbrunsafe doesn't print the error
		}
	},
};

async function initdb(db) {
	await dbutils.run(
		db,
		`CREATE TABLE IF NOT EXISTS wcp_project (
            id integer PRIMARY KEY autoincrement,
            atype text,
            apath text,
            ajson text,
            createtime TIMESTAMP default (datetime('now', 'localtime'))
        )`
	);
	await dbutils.run(
		db,
		`CREATE TABLE IF NOT EXISTS wcp_system (
            id integer PRIMARY KEY autoincrement,
            aname text,
            avalue text,
            ajson text,
            createtime TIMESTAMP default (datetime('now', 'localtime'))
        )`
	);
	await dbutils.run(
		db,
		`CREATE TABLE IF NOT EXISTS wcp_log (
            id integer PRIMARY KEY autoincrement,
            atype text,
            atitle text,
            adesc text,
            actn text,
            createtime TIMESTAMP default (datetime('now', 'localtime'))
        )`
	);
}

const helpText = `web-control-panel help
Usage: wcp [command] [flags]

Displays help information.

Options: 
wcp list-project # list all project you have created
wcp new-project [dirpath] # create a webpack project at target path, default is crt cwd
wcp view # serve a website, it's could help you manage all project

Data Store:
All of project meta information is in ${getStoreDir()}

About me:
Welcome to star or fork :)
Github: https://github.com/tun100/
Repository: https://github.com/tun100/web-control-panel`;

async function entryfunc() {
	if (isEmptyOrHelpArg()) {
		// print help text
		plainlog(helpText);
	} else {
		// get and auto create store dir
		const storedir = getStoreDir();
		if (!isPathExists(storedir)) {
			var msgref = createOra(`homedir not settings(${storedir}), creating...`);
			sh.mkdir('-p', storedir);
			msgref.succeed(`creating homedir(${storedir}) success`);
		}
		// initialize sqlite datafile and data conn
		var db = new sqlite3.Database(getStoreDir('meta.db'));
		initdb(db);
		// start analyze arguments
		let argArr: string[] = getArgWithoutExec();
		let command = _.first(argArr);
		let options = _.get(argArr, 1);
		var msgref = createOra('initializing task...');
		switch (command) {
			case 'list-project':
				break;
			case 'new-project':
				// check path
				if (_.isNil(options)) {
					options = getCwdDir('');
				}
				var newpath = options;
				if (isPathExists(newpath)) {
					msgref.stop();
					var shouldDelRes = await inquirer.prompt([
						{
							type: 'confirm',
							name: 'value',
							message: `path ${newpath} already exists, do you wanna delete it?`,
							default: true,
						},
					]);
					if (shouldDelRes['value']) {
                        msgref = createOra(`deleteing target dir files...`);
						sh.rm('-rf', newpath);
						msgref.succeed(`deleteing target dir`);
						msgref = createOra('program will continue task');
					} else {
						msgref.info(
							`path already created, wcp need an empty and non created dir, the path is ${newpath}`
						);
						exitProgram(-1);
					}
				}
				sh.mkdir('-p', newpath);
				msgref.succeed(`new project path is ${newpath}`);
				msgref.stop();
				msgref = createOra(`initializing project files...`);
				sh.cp('-rf', [getCrtPath('../conf/*', __dirname), getCrtPath('../conf/.*', __dirname)], newpath);
				msgref.succeed(`finish init project files`);
				// ask user which dep tools to use
				var toolres = await inquirer.prompt([
					{
						type: 'list',
						name: 'value',
						choices: ['npm', 'cnpm', 'yarn'],
						message: 'which one do you wanna use?',
						default: 'npm',
					},
				]);
				// install dependencies
				var toolname = toolres['value'];
				msgref = createOra(`installing dependencies...`);
				sh.cd(newpath);
				switch (toolname) {
					case 'npm':
					case 'cnpm':
						await execSilent(`${toolname} i -S`);
						await execSilent(`${toolname} i -D`);
					case 'yarn':
						await execSilent(`yarn`);
				}
				msgref.succeed(`finish install dependencies`);
				break;
			case 'view':
				break;
		}
	}
}

entryfunc();
