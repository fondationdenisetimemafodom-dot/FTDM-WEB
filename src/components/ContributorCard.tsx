/*-----------------------------------------------------------------------------------------------------
| @file ContributorCard.tsx
| @component ContributorCard
| @brief Displays individual contributor/partner card with image, name, role, and social links
| @param contributor - contributor/partner data object
| @return JSX element of contributor card matching design specifications
-----------------------------------------------------------------------------------------------------*/

import React from "react";
import { FaFacebook, FaTwitter, FaLinkedin } from "react-icons/fa";

interface SocialMediaLinks {
  facebook?: string;
  twitter?: string;
  instagram?: string;
  linkedin?: string;
  website?: string;
}

interface Contributor {
  _id: string;
  name: string;
  role: string;
  type: "contributor" | "partner";
  picture: {
    url: string;
    public_id: string;
  };
  socialMedia?: SocialMediaLinks;
}

interface ContributorCardProps {
  contributor: Contributor;
}

const ContributorCard: React.FC<ContributorCardProps> = ({ contributor }) => {
  return (
    <div className="flex flex-col items-center w-[270px]">
      {/* Profile Image - Rounded rectangle with slight border radius */}
      <div className="w-[270px] h-[270px] rounded-lg overflow-hidden mb-4 bg-gray-100">
        <img
          src={contributor.picture.url}
          alt={contributor.name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Name - Bold and larger */}
      <h3 className="text-xl font-bold text-gray-900 text-center mb-1 uppercase tracking-wide">
        {contributor.name}
      </h3>

      {/* Role - Smaller, lighter text */}
      <p className="text-sm text-gray-600 text-center mb-4">
        {contributor.role}
      </p>

      {/* Social Media Icons - Only show if available */}
      {contributor.socialMedia && (
        <div className="flex items-center justify-center gap-4">
          {contributor.socialMedia.facebook && (
            <a
              href={contributor.socialMedia.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-700 hover:text-blue-600 transition-colors"
            >
              <FaFacebook size={20} />
            </a>
          )}
          {contributor.socialMedia.twitter && (
            <a
              href={contributor.socialMedia.twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-700 hover:text-blue-400 transition-colors"
            >
              <FaTwitter size={20} />
            </a>
          )}
          {contributor.socialMedia.linkedin && (
            <a
              href={contributor.socialMedia.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-700 hover:text-blue-700 transition-colors"
            >
              <FaLinkedin size={20} />
            </a>
          )}
        </div>
      )}
    </div>
  );
};

export default ContributorCard;
