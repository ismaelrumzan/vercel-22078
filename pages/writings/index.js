import path from 'path';
import fs from 'fs';
import matter from 'gray-matter';
import Link from 'next/link';
import { NextSeo } from 'next-seo';

import Layout from '../../components/Layout';
import Image from '../../components/Image';
import { POSTS_PATH, postFilePaths } from '../../lib/utils';
import { getOGImageWithDimensions } from '../../lib/getOGImageUrl';
import { baseUrl } from '../../seo.config';
import getImageProps from '../../lib/getImageProps';

export default function WritingsPage({ allPosts }) {
  return (
    <Layout>
      <NextSeo
        title="Writings"
        openGraph={{
          url: `${baseUrl}writings/`,
          title: 'Writings',
          images: [getOGImageWithDimensions({ title: 'Writings' })],
        }}
      />
      <div className="mt-12">
        <h1 className="text-5xl mb-12 font-bold text-headings">Writings</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 gap-y-8 max-w-5xl mx-auto">
          {allPosts.map((post) => (
            <div className="mt-4" key={post.slug}>
              <Link href={post.slug}>
                <a>
                  {!!post.frontmatter.banner && (
                    <div className="aspect-w-16 aspect-h-9 relative w-full h-64">
                      <Image
                        {...post.frontmatter.bannerImageProps}
                        className="rounded-md w-full h-64"
                        alt={`Banner image for ${post.frontmatter.title}`}
                        layout="fill"
                        objectFit="cover"
                      />
                    </div>
                  )}
                </a>
              </Link>
              <h3 className="text-lg font-bold mt-4">
                <Link href={post.slug}>
                  <a className="no-underline text-headings">{post.frontmatter.title}</a>
                </Link>
              </h3>
              <p
                className="text-lg mt-4 block max-w-full break-all"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}

export const getStaticProps = async () => {
  const allPosts = [];
  for (const postPath of postFilePaths()) {
    const postFilePath = path.join(POSTS_PATH, postPath);
    const source = fs.readFileSync(postFilePath, { encoding: 'utf-8' });

    const { content, data } = matter(source);

    if (data.published !== undefined && data.published === false) continue;

    const slug = postPath.replace(/\.mdx?$/, '').replace(/\/index/, '');

    /**
     * If there is no banner image, first image from the content is used
     */
    if (!data.banner) {
      const firstImageFromContent = content.match(/\!\[.*?\]\((.*?)\)/);
      if (firstImageFromContent) {
        data.banner = firstImageFromContent[1];
      }
    }
    data.bannerImageProps = await getImageProps(`/images/${slug}/${data.banner}`);

    allPosts.push({
      frontmatter: data,
      content: content.slice(0, 150) + '...',
      slug: '/writings/' + slug + '/',
    });
  }

  return {
    props: {
      allPosts: allPosts
        .filter(Boolean)
        .sort(
          (a, b) => new Date(b.frontmatter.date).getTime() - new Date(a.frontmatter.date).getTime()
        ),
    },
  };
};
