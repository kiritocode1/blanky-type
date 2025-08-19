import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	module: {
		rules: [
			{
				test: /\.mp3$/,
        use: [ 
          {
            loading:"file-loader"
          }
        ]
			},
		],
	},
};

export default nextConfig;
