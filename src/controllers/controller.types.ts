import { AdminAccessService } from "../services/admin-access.service";
import { CategoryService } from "../services/category.service";
import { NavigationService } from "../services/navigation.service";
import { UserStateService } from "../services/user-state.service";
import { VideoService } from "../services/video.service";

export interface ControllerDeps {
  adminAccessService: AdminAccessService;
  categoryService: CategoryService;
  videoService: VideoService;
  userStateService: UserStateService;
  navigationService: NavigationService;
}

