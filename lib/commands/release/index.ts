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
import Command from '../../command';
import * as cf from '../../utils/common-flags';
import { getBalenaSdk, getVisuals, stripIndent } from '../../utils/lazy';

interface FlagsDef {
	help: void;
	finalize?: boolean;
}

interface ArgsDef {
	commit?: string;
}

export default class ReleaseCmd extends Command {
	public static description = stripIndent`
		Get info for a release.
		Finalize a release.
`;
	public static examples = ['$ balena release MyFleet commit'];

	public static usage = 'release <commit>';

	public static flags: flags.Input<FlagsDef> = {
		help: cf.help,
	};

	public static args = [
		{
			name: 'commit',
			description: 'the commit of the release to get information',
		},
	];

	public static authenticated = true;

	public async run() {
		const { args: params } = this.parse<FlagsDef, ArgsDef>(ReleaseCmd);
		if (!params.commit) {
			const { ExpectedError } = await import('../../errors');
			throw new ExpectedError('You must specify a release commit');
		}

		const fields = [
			'commit',
			'created_at',
			'status',
			'semver',
			'is_final',
			'build_log',
			'start_timestamp',
			'end_timestamp',
			'release_tag',
		];

		const balena = getBalenaSdk();

		const release = await balena.models.release.get(params.commit!);
		if (!release) {
			const { ExpectedError } = await import('../../errors');
			throw new ExpectedError(`Release ${params.commit} not found!`);
		}

		const _ = await import('lodash');
		console.log(
			getVisuals().table.vertical(
				_.mapValues(release, (val) => val ?? 'N/a'),
				fields,
			),
		);
	}
}
