import RainerDashboard from "@/apps/rainer/ui/RainerDashboard";
import {RainerProvider} from "@/apps/rainer/hooks";


function Page() {
    return (
        <RainerProvider>
            <RainerDashboard/>
        </RainerProvider>
    )
}

export default Page;