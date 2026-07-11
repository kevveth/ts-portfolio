import type { ReactNode } from "react";
import { Surface } from "#/components/surface";

export function ContentState({ children }: { children: ReactNode }) {
	return (
		<Surface className="p-8 text-center" role="status">
			<p className="text-sm text-muted-foreground">{children}</p>
		</Surface>
	);
}
