import type { LocationSlug } from "@/lib/locationContent";

export type Testimonial = {
  quote: string;
  author: string;
  business: string;
};

type LocationTestimonials = {
  featured: Testimonial;
  others: Testimonial[];
};

export const testimonialsByLocation: Record<LocationSlug, LocationTestimonials> = {
  root: {
    featured: {
      quote:
        "I had a Facebook page and nothing else. Noah built me a real site in two weeks. I've had 3 new customers call me directly from Google since it went live.",
      author: "Marcus Williams",
      business: "Traverse City, MI",
    },
    others: [
      {
        quote:
          "I run a salon and I'm not a tech person. Noah set everything up including my website, my Google listing, and a system that texts me every time someone books online.",
        author: "Brittany Alvarez",
        business: "Frankfort, MI",
      },
      {
        quote:
          "Our old site looked like it was built in 2008. Noah rebuilt it in two weeks and now we get inquiries through the contact form almost every day.",
        author: "David Nguyen",
        business: "Grand Rapids, MI",
      },
    ],
  },
  houston: {
    featured: {
      quote:
        "I had a Facebook page and nothing else. Noah built me a real site in two weeks. I've had 3 new customers call me directly from Google since it went live.",
      author: "Marcus Williams",
      business: "Houston, TX",
    },
    others: [
      {
        quote:
          "I run a salon and I'm not a tech person. Noah set everything up including my website, my Google listing, and a system that texts me every time someone books online.",
        author: "Brittany Alvarez",
        business: "Houston Heights, TX",
      },
      {
        quote:
          "Our old site looked like it was built in 2008. Noah rebuilt it in two weeks and now we get inquiries through the contact form almost every day.",
        author: "David Nguyen",
        business: "Sugar Land, TX",
      },
    ],
  },
  texas: {
    featured: {
      quote:
        "I had a Facebook page and nothing else. Noah built me a real site in two weeks. I've had 3 new customers call me directly from Google since it went live.",
      author: "Marcus Williams",
      business: "Houston, TX",
    },
    others: [
      {
        quote:
          "I run a salon and I'm not a tech person. Noah set everything up including my website, my Google listing, and a system that texts me every time someone books online.",
        author: "Brittany Alvarez",
        business: "Houston Heights, TX",
      },
      {
        quote:
          "Our old site looked like it was built in 2008. Noah rebuilt it in two weeks and now we get inquiries through the contact form almost every day.",
        author: "David Nguyen",
        business: "Sugar Land, TX",
      },
    ],
  },
  michigan: {
    featured: {
      quote:
        "I had a Facebook page and nothing else. Noah built me a real site in two weeks. I've had 3 new customers call me directly from Google since it went live.",
      author: "Marcus Williams",
      business: "Bay City, MI",
    },
    others: [
      {
        quote:
          "I run a salon and I'm not a tech person. Noah set everything up including my website, my Google listing, and a system that texts me every time someone books online.",
        author: "Brittany Alvarez",
        business: "Midland, MI",
      },
      {
        quote:
          "Our old site looked like it was built in 2008. Noah rebuilt it in two weeks and now we get inquiries through the contact form almost every day.",
        author: "David Nguyen",
        business: "Saginaw, MI",
      },
    ],
  },
};

// Legacy exports — kept for any existing imports; point to root set
export const featuredTestimonial: Testimonial = testimonialsByLocation.root.featured;
export const testimonials: Testimonial[] = testimonialsByLocation.root.others;
