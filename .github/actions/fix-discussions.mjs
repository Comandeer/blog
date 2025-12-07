/* eslint-disable no-console, no-await-in-loop, @stylistic/dot-location */

import { execSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { resolve as resolvePath } from 'node:path';
import { cwd, env } from 'node:process';
import { Octokit } from '@octokit/action';

const FRONT_MATTER_REGEX = /^---\n(?<content>(?:.|\n)+)\n---/u;
const PERMALINK_TRIM_REGEX = /\.html$/gu;
const DESCRIPTION_TRIM_REGEX = /^"|"$/gu;

const octokit = new Octokit();

/**
 * @typedef {Object} PostMetadata
 * @property {string} slug
 * @property {string} description
 * @property {boolean} comments
 */

/**
 * @typedef {Object} ExistingDiscussion
 * @property {string} title
 */

await main();

async function main() {
	const postFiles = getPostFiles( env.GITHUB_SHA, env.POSTS_DIR_PATH );
	const posts = await getPostMetadata( postFiles );
	const missingPosts = await getPostsWithoutDiscussions( {
		posts,
		repository: env.GITHUB_REPOSITORY
	} );

	console.log( 'Brakujących dyskusji:', missingPosts.length );

	await createMissingDiscussions( {
		repository: env.GITHUB_REPOSITORY,
		categoryId: env.CATEGORY_ID,
		posts: missingPosts,
		blogUrl: env.BLOG_URL
	} );
}

/**
 * @param {string} commitHash
 * @param {string} postsDirPath
 * @returns {Array<string>}
 */
function getPostFiles( commitHash, postsDirPath ) {
	const rawCommitInfo = execSync( `git diff-tree --no-commit-id --name-only ${ commitHash } -r` );
	const commitInfo = rawCommitInfo.toString( 'utf-8' );
	const lines = commitInfo.split( '\n' );

	return lines
		.filter( ( line ) => {
			const trimmedLine = line.trim();

			return trimmedLine.startsWith( postsDirPath ) && trimmedLine.endsWith( '.md' );
		} )
		.map( ( path ) => {
			return resolvePath( cwd(), path.trim() );
		} );
}

/**
 *
 * @param {Array<string>} postFiles
 * @returns {Promise<Array<PostMetadata>>}
 */
async function getPostMetadata( postFiles ) {
	/**
	 * @type {Array<PostMetadata>}
	 */
	const posts = [];

	for await ( const postFilePath of  postFiles ) {
		const postContent = await readFile( postFilePath, 'utf-8' );
		const postMetadata = extractMetadata( postContent );

		if ( postMetadata.comments ) {
			posts.push( postMetadata );
		}
	}

	return posts;
}

/**
 * @param {string} content
 * @returns {PostMetadata}
 */
function extractMetadata( content ) {
	const frontMatter = content.match( FRONT_MATTER_REGEX );
	const lines = frontMatter.groups.content.split( '\n' );

	return lines.reduce( ( metadata, line ) => {
		if ( line.startsWith( 'permalink' ) ) {
			const [ , lineContent ] = line.split( ':' );

			return {
				...metadata,
				slug: lineContent.trim().replace( PERMALINK_TRIM_REGEX, '' )
			};
		}

		if ( line.startsWith( 'comments' ) ) {
			const [ , lineContent ] = line.split( ':' );

			return {
				...metadata,
				comments: lineContent.trim() === 'true' ? true : false
			};
		}

		if ( line.startsWith( 'description' ) ) {
			const [ , lineContent ] = line.split( ':' );

			return {
				...metadata,
				description: lineContent.trim().replace( DESCRIPTION_TRIM_REGEX, '' )
			};
		}

		return metadata;
	}, {} );
}

/**
 * @typedef {Object} GetPostsWithoutDiscussionsOptions
 * @property {string} repository
 * @property {string} categoryId
 * @property {Array<PostMetadata>} posts
 */

/**
 * @param {GetPostsWithoutDiscussionsOptions} options
 * @returns {Promise<Array<PostMetadata>}
 */
async function getPostsWithoutDiscussions( options ) {
	/**
	 * @type {Array<PostMetadata>}
	 */
	const postsWithoutDiscussions = [];

	for ( const post of options.posts ) {
		if ( await isMissingDiscussion( options.repository, post.slug ) ) {
			postsWithoutDiscussions.push( post );
		}

		await sleep( getRandomNumber( 1, 5 ) );
	}

	return postsWithoutDiscussions;
}

/**
 * @param {string} repository
 * @param {string} title
 * @returns {Promise<boolean>}
 */
async function isMissingDiscussion( repository, title ) {
	const searchQuery = `repo:${ repository } in:title "${ title }"`;
	const graphqlQuery = `
		query($searchQuery: String!) {
			search(query: $searchQuery, type: DISCUSSION, first: 1) {
				edges {
					node {
						... on Discussion {
							title
						}
					}
				}
			}
		}
	`;

	const result = await octokit.graphql( graphqlQuery, {
		searchQuery
	} );
	const discussions = result.search.edges.map( ( edge ) => {
		return edge.node;
	} );

	return discussions.findIndex( ( discussion ) =>  {
		return discussion.title === title;
	} ) === -1;
}

/**
 * @typedef {Object} CreateMissingDiscussionsOptions
 * @property {string} repository
 * @property {string} categoryId
 * @property {Array<PostMetadata>} posts
 * @property {string} blogUrl
 */

/**
 * @param {CreateMissingDiscussionsOptions} options
 * @returns {Promise<void>}
 */
async function createMissingDiscussions( options ) {
	const [ owner, repo ] = options.repository.split( '/' );
	const repositoryId = await getRepositoryId( owner, repo );

	for ( const post of options.posts ) {
		await createDiscussion( {
			repositoryId,
			categoryId: options.categoryId,
			title: post.slug,
			body: createDiscussionBody( post, options.blogUrl )
		} );

		await sleep( getRandomNumber( 1, 5 ) );
	}
}

/**
 * @param {string} owner
 * @param {string} name
 * @returns {Promise<string>}
 */
async function getRepositoryId( owner, name ) {
	const query = `
		query($owner: String!, $name: String!) {
			repository(owner: $owner, name: $name) {
				id
			}
		}`;

	const result = await octokit.graphql( query, {
		owner,
		name
	} );

	return result.repository.id;
}

/**
 * @typedef {Object} CreateDiscussionOptions
 * @property {string} repositoryId
 * @property {string} title
 * @property {string} body
 * @property {string} categoryId
 */
/**
 *
 * @param {CreateDiscussionOptions} options
 * @returns {Promise<void>}
 */
async function createDiscussion( options ) {
	const query = `
		mutation($input: CreateDiscussionInput!) {
			createDiscussion(input: $input) {
				discussion {
					title
				}
			}
		}`;
	const response = await octokit.graphql( query, {
		input: options
	} );

	console.log( 'Created discussion', response.createDiscussion.discussion.title );
}

/**
 * @param {PostMetadata} post
 * @param {string} blogUrl
 * @returns {string}
 */
function createDiscussionBody( { slug, description }, blogUrl ) {
	const link = `${ blogUrl }${ slug }`;

	return `# ${ slug }

${ description }

${ link }`;
}

/**
 *
 * @param {number} seconds
 * @returns {Promise<void>}
 */
async function sleep( seconds ) {
	return new Promise( ( resolve ) => {
		setTimeout( resolve, seconds * 1000 );
	} );
}

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random#getting_a_random_integer_between_two_values_inclusive
/**
 *
 * @param {number} min
 * @param {number} max
 * @returns
 */
function getRandomNumber( min, max ) {
	const minCeiled = Math.ceil( min );
	const maxFloored = Math.floor( max );

	return Math.floor( Math.random() * ( maxFloored - minCeiled + 1 ) + minCeiled );
}
