import React from 'react';
import { motion } from 'framer-motion';

const Footer = () => (
    <motion.footer 
        className="bg-black text-white"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
    >
        <div className="container mx-auto px-4 py-8 text-center text-gray-400">
            <p className="font-semibold">&copy; 2025 All Rights Reserved by PM Shree Kendriya Vidyalaya Unnao</p>
            <p className="text-sm mt-1">Powered by <span className="font-bold text-accent-blue">KVISION</span></p>
        </div>
    </motion.footer>
);

export default Footer;
