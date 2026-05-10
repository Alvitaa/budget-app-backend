import { Controller, Get, Query, Req, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";
import { AnalyticsService } from "./analytics.service";
import { GetAnalyticsDTO } from "./DTOs/getAnalytics.dto";

@UseGuards(JwtAuthGuard)
@Controller("analytics")
export class AnalyticsController {
    constructor(private analyticsService: AnalyticsService) {}

    @Get()
    async getDashboard(@Req() req, @Query() query: GetAnalyticsDTO) {
        const userId = req.user.id;
        const {year, month} = query;
        return this.analyticsService.getDashboard(userId, year, month);
    }
}