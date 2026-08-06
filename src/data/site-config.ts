import avatar from '../assets/images/about.jpg';
import hero from '../assets/images/hero.jpg';
import type { SiteConfig } from '../types';

const siteConfig: SiteConfig = {
    website: 'https://gabGABY006.github.io',
    avatar: {
        src: avatar,
        alt: 'Gabriella Castro'
    },
    title: 'Gabriella Castro',
    subtitle: 'Systems Engineering Student | UX/UI Enthusiast & Developer',
    description: 'Personal portfolio and tech blog of Gabriella Castro. Exploring UX/UI design, software engineering, Figma creations, algorithms, and web development.',
    image: {
        src: '/dante-preview.jpg',
        alt: 'Gabriella Castro Portfolio'
    },
    headerNavLinks: [
        {
            text: 'Home',
            href: '/'
        },
        {
            text: 'About',
            href: '/about'
        },
        {
            text: 'Projects',
            href: '/projects'
        },
        {
            text: 'Blog',
            href: '/blog'
        },
        {
            text: 'GitHub',
            href: 'https://github.com/gabgaby006'
        }
    ],
    footerNavLinks: [
        {
            text: 'About',
            href: '/about'
        },
        {
            text: 'Projects',
            href: '/projects'
        },
        {
            text: 'Blog',
            href: '/blog'
        },
        {
            text: 'Contact',
            href: '/contact'
        }
    ],
    socialLinks: [
        {
            text: 'GitHub',
            href: 'https://github.com/gabgaby006'
        },
        {
            text: 'LinkedIn',
            href: 'https://www.linkedin.com/in/gabriella-michelle-castro-cuello-257283363/'
        },
        {
            text: 'Instagram',
            href: 'https://www.instagram.com/gabycas2007/'
        }
    ],
    hero: {
        title: 'Hi There & Welcome to My Corner of the Web!',
        text: "I'm **Gabriella Castro**, a Systems Engineering student passionate about **UX/UI design**, software development, and creative digital projects.\n\nWhen I'm not solving algorithmic challenges, you'll find me designing UI concepts in **Figma** (like custom Pokémon-style cards!), following **Formula 1**, or experimenting with new web tech stacks.\n\nFeel free to explore my open-source code on [GitHub](https://github.com/gabgaby006), check out my latest work on my [Projects](/projects) page, or read through my posts on the [Blog](/blog)!",
        image: {
            src: hero,
            alt: 'Workspace setup'
        },
        actions: [
            {
                text: 'View Projects',
                href: '/projects'
            },
            {
                text: 'Get in Touch',
                href: '/contact'
            }
        ]
    },
    subscribe: {
        enabled: true,
        title: 'Subscribe to Updates',
        text: 'Get notified whenever I publish new blog posts, project write-ups, or technical notes.',
        form: {
            action: '#'
        }
    },
    postsPerPage: 8,
    projectsPerPage: 8
};

export default siteConfig;