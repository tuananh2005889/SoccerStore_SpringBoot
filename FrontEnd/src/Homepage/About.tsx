import React from 'react';

const About: React.FC = () => (
  <section id="about" className="py-20 bg-gray-100">
    <div className="max-w-5xl mx-auto px-4 text-center animate-fadeInUp">
      <h2 className="text-4xl font-extrabold text-gray-900 mb-6">About <span className="text-green-700">SoccerGear</span></h2>
      <p className="text-lg text-gray-700 leading-relaxed max-w-3xl mx-auto">
        SoccerGear is your premier destination for high-quality football equipment. We are passionate about the beautiful game and committed to providing athletes of all levels with the best gear to enhance their performance on the pitch. From cutting-edge footwear to durable balls and comfortable apparel, we curate a selection of top brands to ensure you always have the competitive edge.
      </p>
    </div>
  </section>
);

export default About;