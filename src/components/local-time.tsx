import { useEffect, useState } from "react";

const dateFormat = new Intl.DateTimeFormat("en-US", {
	timeZone: "America/Los_Angeles",
	month: "2-digit",
	day: "2-digit",
	year: "numeric",
});
const timeFormat = new Intl.DateTimeFormat("en-US", {
	timeZone: "America/Los_Angeles",
	hour: "numeric",
	minute: "2-digit",
	hour12: true,
});

export function LocalTime() {
	// Start empty so prerendered HTML never shows a stale deployment-time clock.
	const [now, setNow] = useState<Date | null>(null);

	useEffect(() => {
		let timer: ReturnType<typeof setTimeout>;
		const update = () => {
			setNow(new Date());
			timer = setTimeout(update, 60_000 - (Date.now() % 60_000));
		};
		update();
		return () => clearTimeout(timer);
	}, []);

	return (
		<p className="site-byline">
			{now ? (
				<>
					<time dateTime={now.toISOString()}>
						{dateFormat.format(now)}{" "}
						{timeFormat.format(now).replace(/\s/g, "").toLowerCase()}
					</time>{" "}
				</>
			) : null}
			<abbr title="San Diego" className="no-underline">
				SD
			</abbr>
		</p>
	);
}
