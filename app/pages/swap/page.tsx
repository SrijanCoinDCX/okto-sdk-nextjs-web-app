"use client";

import PortfolioCard from "@/app/components/Swap/PortfolioCard";
import SwapTokensPage from "@/app/components/Swap/SwapToken";

export default function SwapTokenPage() {

    return (
        <main className="flex min-h-screen flex-col items-center bg-violet-200 w-full">
            <div
                className="absolute inset-0 bg-no-repeat bg-center bg-fit"
                style={{ backgroundImage: "url('https://app.osmosis.zone/images/osmosis-home-bg-alt.svg')" }}
            >
                <div className="relative z-10 flex flex-col items-center justify-center min-h-screen">
                    <div className="flex flex-row items-start justify-center gap-4 min-h-min min-w-min">
                        <div className="flex-shrink-0">
                            <SwapTokensPage />
                        </div>
                        <div className="flex-shrink-0">
                            <PortfolioCard />
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
} 