import _ from "lodash";

export const getClassName = (
	name: string,
	level = 0,
	levelParent?: number,
	index?: number
) =>
	`${_.trim(
		`${name}-${_.isNumber(levelParent) ? levelParent : ""}-${
			_.isNumber(level) ? level : ""
		}-${_.isNumber(index) ? index : ""}`
	)}`;
