package com.kptest.support;

import com.kptest.application.service.AdminService;
import com.kptest.application.service.AuthenticationService;
import com.kptest.application.service.BackupService;
import com.kptest.application.service.BadgeService;
import com.kptest.application.service.CalendarService;
import com.kptest.application.service.EventChangeRequestService;
import com.kptest.application.service.HisService;
import com.kptest.application.service.InboxService;
import com.kptest.application.service.MaterialService;
import com.kptest.application.service.MessageService;
import com.kptest.application.service.NotificationService;
import com.kptest.application.service.PatientService;
import com.kptest.application.service.ProjectService;
import com.kptest.application.service.QuizService;
import com.kptest.application.service.RegistrationService;
import com.kptest.application.service.ReportService;
import com.kptest.application.service.TherapyStageService;
import com.kptest.domain.audit.repository.AuditLogRepository;
import com.kptest.domain.audit.repository.DataProcessingActivityRepository;
import com.kptest.domain.audit.repository.DataProcessingErasureLogRepository;
import com.kptest.domain.audit.repository.SystemLogRepository;
import com.kptest.domain.user.UserRepository;
import com.kptest.infrastructure.config.CustomUserDetailsService;
import com.kptest.infrastructure.security.JwtAuthenticationFilter;
import com.kptest.infrastructure.security.JwtService;
import com.kptest.infrastructure.security.RefreshTokenService;
import com.kptest.infrastructure.security.TotpService;
import org.mockito.Mockito;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;

/**
 * Shared mock beans for @WebMvcTest controller slices.
 *
 * KptestApplication's broad @ComponentScan causes @WebMvcTest to load every
 * @RestController, which transitively requires all services and their JPA
 * repositories. This @TestConfiguration short-circuits the chain by exposing
 * Mockito mocks for every service / security collaborator that may be wired in.
 *
 * Tests still declare their own @MockBean for the specific service they need
 * to stub; that @MockBean overrides the bean defined here.
 */
@TestConfiguration
public class WebMvcMockBeansConfig {

    @Bean @Primary public AdminService adminService() { return Mockito.mock(AdminService.class); }
    @Bean @Primary public AuthenticationService authenticationService() { return Mockito.mock(AuthenticationService.class); }
    @Bean @Primary public BackupService backupService() { return Mockito.mock(BackupService.class); }
    @Bean @Primary public BadgeService badgeService() { return Mockito.mock(BadgeService.class); }
    @Bean @Primary public CalendarService calendarService() { return Mockito.mock(CalendarService.class); }
    @Bean @Primary public EventChangeRequestService eventChangeRequestService() { return Mockito.mock(EventChangeRequestService.class); }
    @Bean @Primary public HisService hisService() { return Mockito.mock(HisService.class); }
    @Bean @Primary public InboxService inboxService() { return Mockito.mock(InboxService.class); }
    @Bean @Primary public MaterialService materialService() { return Mockito.mock(MaterialService.class); }
    @Bean @Primary public MessageService messageService() { return Mockito.mock(MessageService.class); }
    @Bean @Primary public NotificationService notificationService() { return Mockito.mock(NotificationService.class); }
    @Bean @Primary public PatientService patientService() { return Mockito.mock(PatientService.class); }
    @Bean @Primary public ProjectService projectService() { return Mockito.mock(ProjectService.class); }
    @Bean @Primary public QuizService quizService() { return Mockito.mock(QuizService.class); }
    @Bean @Primary public RegistrationService registrationService() { return Mockito.mock(RegistrationService.class); }
    @Bean @Primary public ReportService reportService() { return Mockito.mock(ReportService.class); }
    @Bean @Primary public TherapyStageService therapyStageService() { return Mockito.mock(TherapyStageService.class); }

    // Security collaborators referenced by JwtAuthenticationFilter / SecurityConfig
    @Bean @Primary public JwtService jwtService() { return Mockito.mock(JwtService.class); }
    @Bean @Primary public RefreshTokenService refreshTokenService() { return Mockito.mock(RefreshTokenService.class); }
    @Bean @Primary public TotpService totpService() { return Mockito.mock(TotpService.class); }
    @Bean @Primary public JwtAuthenticationFilter jwtAuthenticationFilter() { return Mockito.mock(JwtAuthenticationFilter.class); }
    @Bean @Primary public CustomUserDetailsService customUserDetailsService() { return Mockito.mock(CustomUserDetailsService.class); }

    // Repositories pulled in by AuthController / AdminController etc.
    @Bean @Primary public UserRepository userRepository() { return Mockito.mock(UserRepository.class); }
    @Bean @Primary public AuditLogRepository auditLogRepository() { return Mockito.mock(AuditLogRepository.class); }
    @Bean @Primary public SystemLogRepository systemLogRepository() { return Mockito.mock(SystemLogRepository.class); }
    @Bean @Primary public DataProcessingActivityRepository dataProcessingActivityRepository() { return Mockito.mock(DataProcessingActivityRepository.class); }
    @Bean @Primary public DataProcessingErasureLogRepository dataProcessingErasureLogRepository() { return Mockito.mock(DataProcessingErasureLogRepository.class); }
}
