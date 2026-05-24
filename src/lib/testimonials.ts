export type Testimonial = {
  quote: string;
  author: string;
  business: string;
};

export const featuredTestimonial: Testimonial = {
  quote:
    "I had a Facebook page and nothing else. Noah built me a real site in two weeks. I've had 3 new customers call me directly from Google since it went live.",
  author: "Marcus Williams",
  business: "HVAC · Houston, TX",
};

export const testimonials: Testimonial[] = [
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
    business: "Law · Sugar Land, TX",
  },
];
