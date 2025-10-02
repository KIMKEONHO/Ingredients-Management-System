package com.example.ingredients_ms.global.init;
import com.example.ingredients_ms.domain.ingredients.service.IngredientsUploadService;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
// app.data.initialize 속성의 값이 'true'일 때만 이 컴포넌트를 활성화합니다.
// 만약 해당 속성이 없으면 실행되지 않습니다 (matchIfMissing = false가 기본값).
@ConditionalOnProperty(name = "app.data.initialize", havingValue = "true")
public class DataInitializer implements CommandLineRunner {

    private final IngredientsUploadService uploadService;

    @Override
    public void run(String... args) throws Exception {
        // application.yml의 설정에 따라 이 코드가 실행되므로,
        // 더 이상 DB를 확인하는 코드는 필요 없습니다.
        System.out.println("YAML 설정에 따라 데이터 초기화를 시작합니다...");
        try {
            uploadService.loadIngredientsFromJson();
            System.out.println("데이터 초기화가 성공적으로 완료되었습니다.");
        } catch (Exception e) {
            System.err.println("데이터 초기화 중 오류가 발생했습니다.");
            e.printStackTrace();
        }
    }
}