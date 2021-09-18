/**
 * @license
 * Copyright 2016-2020 Balena Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { flags } from '@oclif/command';
import Command from '../command';
import * as cf from '../utils/common-flags';
import { getBalenaSdk, getVisuals, stripIndent } from '../utils/lazy';

interface FlagsDef {
	help: void;
}

interface ArgsDef {
	fleet?: string;
}

export default class ReleasesCmd extends Command {
	public static description = stripIndent`
		List all releases for a fleet.
`;
	public static examples = ['$ balena releases MyFleet'];

	public static usage = 'releases';

	public static flags: flags.Input<FlagsDef> = {
		help: cf.help,
	};

	public static args = [
		{
			name: 'fleet',
			description: 'fleet name or slug',
		},
	];

	public static authenticated = true;

	public async run() {
		const { args: params } = this.parse<FlagsDef, ArgsDef>(ReleasesCmd);
		if (!params.fleet) {
			const { ExpectedError } = await import('../errors');
			throw new ExpectedError('You must specify a fleet');
		}

		await this.listReleases(params);
	}

	protected async listReleases(params: ArgsDef) {
		const fields = ['commit', 'created_at', 'status', 'semver', 'is_final'];

		const balena = getBalenaSdk();

		const releases = await balena.models.release.getAllByApplication(
			params.fleet!,
		);

		const _ = await import('lodash');
		console.log(
			getVisuals().table.horizontal(
				releases.map((rel) => _.mapValues(rel, (val) => val ?? 'N/a')),
				fields,
			),
		);
	}
}
