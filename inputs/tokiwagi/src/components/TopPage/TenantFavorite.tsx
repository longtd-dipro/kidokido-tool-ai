import React from "react";
import Link from "next/link";
import FavoriteIcon from "@mui/icons-material/Favorite";

type Props = {
  fullName: string;
  address: string;
  code: string;
}

export default function TenantFavorite({ fullName, address, code }: Props ) {

  return (
    <Link href={`/tenant/${code}`} legacyBehavior>
      <a
        className="block p-4 max-w-sm bg-white rounded-lg border border-gray-200 shadow-md
        hover:bg-gray-100 dark:bg-gray-500 dark:border-gray-500 dark:hover:bg-gray-500"
      >
        <div className="flex items-center justify-between relative">
          <div className="">
            <h5 className="mb-2 text-lg font-bold tracking-tight text-gray-900 dark:text-white capitalize">
              {fullName}
            </h5>
            <p className="font-normal text-gray-700 dark:text-gray-400">
              {address}
            </p>
          </div>
          <div className="z-10 absolute inset-y-0 right-0"><FavoriteIcon color="error"/></div>
        </div>
      </a>
    </Link>
  );
}
