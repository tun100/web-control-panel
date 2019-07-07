import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as process from 'process';
import * as inquirer from 'inquirer';

var ora = require('ora');
var _ = require('lodash');
var sh = require('shelljs');
import { wcp_system_conf } from './entrypoint';
export function createNewInfoSession(msg: string) {
	return ora(msg).start();
}
export function getAppHomeDir(targetPath: string = '') {
	var storedir = path.join(os.homedir(), '.wcpstore', targetPath);
	return storedir;
}
export function getStoreDir(targetPath: string = '') {
	return path.join(wcp_system_conf['storedir'] || '', targetPath);
}
export const dbutils = {
	count: async function(db, sql: string, param?: {}) {
		var res = await dbutils.all(db, `select count(*) as ctn from (${sql}) ctntb`);
		return _.get(res, '0.ctn');
	},
	handleIfEmpty: async function(db, sql: string, param: {}, ifempty: () => {}, returndata?: boolean) {
		var res_ctn = await dbutils.count(db, sql, param);
		if (res_ctn === 0) {
			await ifempty();
		}
		if (returndata) {
			var res_data = await dbutils.all(db, sql, param);
			return res_data;
		}
	},
	all: async function(db, sql: string, param?: {}) {
		return new Promise((res_func, err_func) => {
			db.all(sql, param, function(error, res) {
				if (error) {
					err_func(error);
				} else {
					res_func(res);
				}
			});
		});
	},
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
